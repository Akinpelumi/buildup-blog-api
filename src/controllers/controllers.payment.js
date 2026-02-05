import { v4 as uuidv4 } from 'uuid';
import db from '../config/db/index.js';
import * as postModel from '../models/models.post.js';
import * as paymentService from '../services/payment/services.payment.js';

export const initiatePayment = async(req, res) => {
  try {
    const { body } = req;
    
    if (!body.payment_type) {
      return res.status(422).json({
        status: 'error',
        message: 'Missing required fields: payment_type is required.'
      });
    }

    if (body.payment_type === 'one-time' && !body.post_id) {
      return res.status(422).json({
        status: 'error',
        message: 'Missing required field: post_id is required for one-time payments.'
      });
    }

    if (body.payment_type === 'subscription' && !body.plan_id) {
      return res.status(422).json({
        status: 'error',
        message: 'Missing required field: plan_id is required for subscription payments.'
      });
    }

    let amount = 0;

    if (body.payment_type === 'one-time') {
      const post = await postModel.postExists(body.post_id);
      if (!post) {
        return res.status(404).json({
          status: 'error',
          message: 'Post not found, payment can not be processed'
        });
      }
      const oneTimePlan = await db.oneOrNone('SELECT * FROM subscription_plans WHERE frequency = $1 ORDER BY created_at DESC LIMIT 1', ['daily']);
      if (!oneTimePlan) {
        amount = 50;
      } else {
        amount = oneTimePlan.price;
      }
    }

    if (body.payment_type === 'subscription') {
      const plan = await db.oneOrNone('SELECT * FROM subscription_plans WHERE id = $1', [ body.plan_id ]);
      if (!plan) {
        return res.status(404).json({
          status: 'error',
          message: 'Plan not found, payment can not be processed'
        });
      }
      amount = plan.price;
    }

    const paymentReference = uuidv4();
    const paymentData = [
      req.user.user_id,
      body.payment_type,
      amount,
      paymentReference,
      body.post_id ?? null,
      body.plan_id ?? null
    ];

    await db.one('INSERT INTO payment_histories(user_id, payment_type, amount, transaction_reference, post_id, plan_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *', paymentData);

    const result = await paymentService.initiatePaystackPayment(req.user.email, amount, paymentReference);
    if (result.status === 200 && result.data.status === true && result.data.message.trim() === 'Authorization URL created') {
      return res.status(200).json({
        status: 'success',
        message: 'Payment initiation successful',
        data: result.data.data
      });
    } else {
      return res.status(parseInt(result.status)).json({
        status: 'error',
        message: result.response?.data?.message || 'Payment initiation failed'
      });
    }
  } catch (error) {}
    return res.status(500).json({
      status: 'error',
      message: error.message || 'An error occurred while initiating payment'
    });
};

export const verifyPayment = async(req, res) => {
  const { query } = req;
  try {
    if (!query.reference) {
      return res.status(422).json({
        status: 'error',
        message: 'Missing required field: reference'
      });
    }

    const referenceExists = await db.oneOrNone('SELECT * FROM payment_histories WHERE transaction_reference = $1', [ query.reference.trim() ]);
    if (!referenceExists) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment reference not found'
      });
    }

    const result = await paymentService.verifyPaystackPayment(query.reference.trim());
    if (result.status === 200 && result.data.status === true && result.data.message.trim() === 'Verification successful') {
      if (result.data.data.status === 'success') {
        await db.none('UPDATE payment_histories SET status = $1, updated_at = NOW(), transaction_id = $3, payment_method = $4 WHERE transaction_reference = $2', 
          [ 'success', query.reference.trim(), result.data.data.id, result.data.data.channel ]);
        await db.none('INSERT INTO subscriptions (user_id, payment_id, start_date, end_date, payment_type, post_id, plan_id) VALUES ($1, $2, NOW(), NOW() + INTERVAL \'1 month\', $3, $4, $5)', 
          [ referenceExists.user_id, referenceExists.id, referenceExists.payment_type, referenceExists.post_id, referenceExists.plan_id ]);
        return res.status(200).json({
          status: 'success',
          message: 'Payment verified successfully',
          data: {
            reference: query.reference.trim(),
            transaction_id: result.data.data.id,
            amount: result.data.data.amount / 100,
            payment_method: result.data.data.channel,
            payment_type: referenceExists.payment_type,
            post_id: referenceExists.post_id,
            plan_id: referenceExists.plan_id
          }
        });
      } else {
        await db.none('UPDATE payment_histories SET status = $1, updated_at = NOW(), transaction_id = $3, payment_method = $4 WHERE transaction_reference = $2', [ 'fail', query.reference.trim(), result.data.data.id, result.data.data.channel ]);
        return res.status(400).json({
          status: 'error',
          message: 'Payment verification failed'
        });
      }
    } else {
      return res.status(parseInt(result.status)).json({
        status: 'error',
        message: result.response?.data?.message || 'Payment verification failed'
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message || 'An error occurred while verifying payment'
    });
  }
}