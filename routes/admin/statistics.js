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

router.get("/statistic/graph", async (req, res) => {
  try {
    // 1st day of each month in epoch from jan to 2024 jan 1
    const months = [
      1672540057, 1675218457, 1677637657, 1680316057, 1682908057, 1685586457,
      1688178457, 1690856857, 1693535257, 1696127257, 1698805657, 1701397657,
      1704076057,
    ];

    const graphMonths = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const graphData = [];

    let hasMore = true;
    let monthCounter = 0;
    let totalGrossSales = 0;
    let totalRefunds = 0;
    let totalFees = 0;
    let startingAfter;
    while (monthCounter <= 11) {
      const balanceTransactions = await stripe.balanceTransactions.list({
        limit: 100,
        created: {
          gte: months[monthCounter],
          lt: months[monthCounter + 1],
        },
        starting_after: startingAfter,
      });

      for (let i = 0; i < balanceTransactions.data.length; i += 1) {
        if (balanceTransactions.data[i].type === "charge") {
          totalGrossSales += balanceTransactions.data[i].amount;
        } else if (balanceTransactions.data[i].type === "refund") {
          totalRefunds += balanceTransactions.data[i].amount;
        }

        if (balanceTransactions.data[i].fee) {
          totalFees += balanceTransactions.data[i].fee;
        }
      }

      hasMore = balanceTransactions.has_more;
      if (hasMore) {
        startingAfter =
          balanceTransactions.data[balanceTransactions.data.length - 1].id;
      } else {
        totalGrossSales /= 100;
        totalRefunds /= 100;
        totalFees /= 100;

        const netVolume = totalGrossSales + totalRefunds - totalFees;
        graphData.push(netVolume);

        monthCounter += 1;
        totalGrossSales = 0;
        totalRefunds = 0;
        totalFees = 0;
      }
    }

    res.status(200).json({ graph_months: graphMonths, graph_data: graphData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err_msg: "Internal server error" });
  }
});

module.exports = router;
