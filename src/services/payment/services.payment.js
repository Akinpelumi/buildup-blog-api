import axios from 'axios';

export const initiatePaystackPayment = async(email, amount, reference) => {
    try {
        const response = await axios.post('https://api.paystack.co/transaction/initialize', {
            email,
            amount: amount * 100,
            reference,
        }, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        return response;
    } catch (error) {
        console.error('Error initiating Paystack payment:', error.message);
        return error;
    }
};

export const verifyPaystackPayment = async(reference) => {
    try {
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        return response;
    } catch (error) {
        console.error('Error verifying Paystack payment:', error.message);
        return error;
    }
}