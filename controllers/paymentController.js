
const axios = require("axios");

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;

const createPayment = async (req, res) => {
  console.log("req.user in createPayment:", req.user);
  try {
    if (!req.user || !req.user.id) {
      console.log("Authentication failed: req.user or req.user.id is missing");
      return res.status(401).json({ message: "User not authenticated" });
    }
    console.log("Authentication passed, proceeding with payment creation");
    // باقي الكود...
    const authResponse = await axios.post("https://accept.paymob.com/api/auth/tokens", {
      api_key: PAYMOB_API_KEY,
    });
    const token = authResponse.data.token;

    const orderResponse = await axios.post("https://accept.paymob.com/api/ecommerce/orders", {
      auth_token: token,
      delivery_needed: false,
      amount_cents: req.body.amount * 100,
      currency: "EGP",
      items: req.body.items,
    });
    const orderId = orderResponse.data.id;

    const paymentKeyResponse = await axios.post("https://accept.paymob.com/api/acceptance/payment_keys", {
      auth_token: token,
      amount_cents: req.body.amount * 100,
      expiration: 3600,
      order_id: orderId,
      billing_data: {
        email: req.user.email,
        first_name: req.user.firstName || "NA",
        last_name: req.user.lastName || "NA",
        phone_number: req.body.phoneNumber || "NA",
        street: req.body.street || "NA",
        city: req.body.city || "NA",
        country: req.body.country || "EG",
        state: req.body.state || "NA",
        postal_code: req.body.postalCode || "NA",
      },
      currency: "EGP",
      integration_id: PAYMOB_INTEGRATION_ID,
    });
    const paymentKey = paymentKeyResponse.data.token;

    console.log("Payment Key generated:", paymentKey);
    res.json({ paymentKey, orderId });
  } catch (error) {
    console.error("Payment Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ message: "Failed to create payment" });
  }
};

module.exports = { createPayment };