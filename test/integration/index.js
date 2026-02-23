import chai from "chai";
import chaiHttp from "chai-http";
import app from "../../src/index.js";

chai.use(chaiHttp);
const { expect } = chai;

describe("GET /", () => {
  it("should return a welcome message", (done) => {
    chai
      .request(app)
      .get("/")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.equals(
          "Welcome to BuildUp Backend Cohort One"
        );
        done();
      });
  });
  it("should return 404 for non-existing route", (done) => {
    chai
      .request(app)
      .get("/non-existing-route")
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.equals("Resource not found");
        done();
      });
  });
});

describe("Authentication", () => { 
  it("Should Register a new user", (done) => {
    chai
        .request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "adesola@gmail.com",
          username: "adesola",
          password: "Password@123",
          first_name: "Adesola",
          last_name: "Akinpelumi"
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equals("Account created successfully");
          done();
        });
  });
  it("Should throw error if email is not email not sent", (done) => {
    chai        
        .request(app)
        .post("/api/v1/auth/register")
        .send({
          username: "adesola",
          password: "Password@123",
          first_name: "Adesola",
          last_name: "Akinpelumi"
        })
        .end((err, res) => {
          expect(res).to.have.status(422);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equals("email, username, password and first_name are required");
          done();
        });
  });
  it("should throw error if password does not pass length validation", (done) => {
    chai
        .request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "adesola@gmail.com",
          username: "adesola",
          password: "pass",
          first_name: "Adesola",
          last_name: "Akinpelumi"
        })
        .end((err, res) => {
          expect(res).to.have.status(422);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equals("password length should not be less than 10");
          done();
        });
  });
  it("should throw error if password does not pass combination validation", (done) => {
    chai
        .request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "adesola@gmail.com",
          username: "adesola",
          password: "password123",
          first_name: "Adesola",
          last_name: "Akinpelumi"
        })
        .end((err, res) => {
          expect(res).to.have.status(422);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equals("password should contain at least one uppercase, lowercase, number and special character");
          done();
        });
  });
});
