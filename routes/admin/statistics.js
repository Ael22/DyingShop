/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_KEY);

const productModel = require("../../models/product");
const verifyToken = require("../../auth/verifyToken");

const router = express.Router();

router.use("/statistic", verifyToken);

router.get("/statistic/totalsale", async (req, res) => {
  try {
    let totalGrossSales = 0;
    let totalRefunds = 0;
    let totalFees = 0;
    let saleCount = 0;

    let hasMore = true;
    let startingAfter;
    while (hasMore) {
      const balanceTransactions = await stripe.balanceTransactions.list({
        limit: 100,
        starting_after: startingAfter,
      });

      for (const transaction of balanceTransactions.data) {
        if (transaction.type === "charge") {
          totalGrossSales += transaction.amount;
          saleCount += 1;
        } else if (transaction.type === "refund") {
          totalRefunds += transaction.amount;
        }

        if (transaction.fee) {
          totalFees += transaction.fee;
        }
      }

      hasMore = balanceTransactions.has_more;
      if (balanceTransactions.data.length > 0) {
        startingAfter =
          balanceTransactions.data[balanceTransactions.data.length - 1].id;
      }
    }

    totalGrossSales /= 100;
    totalRefunds /= 100;
    totalFees /= 100;

    const netVolume = totalGrossSales + totalRefunds - totalFees;

    res.status(200).json({ netVolume, "Number of sales": saleCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

router.get("/statistic/popular", async (req, res) => {
  try {
    Promise.all([
      productModel.getMostSoldProduct(),
      productModel.getMostSoldCategory(),
    ])
      .then((result) => {
        res.status(200).json({
          "Most popular product": result[0],
          "Most popular category": result[1],
        });
      })
      .catch((error) => {
        throw error;
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

module.exports = router;
