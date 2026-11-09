/**
 * Centralized coin calculation functions.
 * All business logic for coin calculations lives here.
 */

/**
 * Calculate Remaining Coin
 * Formula: Balance Coin - Withdraw Coin
 */
function calculateRemainingCoin(balanceCoin, withdrawCoin, withdrawFee) {
  const balance = parseFloat(balanceCoin) || 0;
  const withdraw = parseFloat(withdrawCoin) || 0;
  return balance - withdraw;
}

/**
 * Calculate Total Coin
 * Formula: Remaining Coin (Balance Coin - Withdraw Coin)
 */
function calculateTotalCoin(balanceCoin, withdrawCoin, withdrawFee) {
  return calculateRemainingCoin(balanceCoin, withdrawCoin, withdrawFee);
}

/**
 * Recalculate all derived coin fields given raw inputs.
 */
function recalculate({ balanceCoin, withdrawCoin, withdrawFee }) {
  const remainingCoin = calculateRemainingCoin(balanceCoin, withdrawCoin, withdrawFee);
  const totalCoin = calculateTotalCoin(balanceCoin, withdrawCoin, withdrawFee);
  return { remainingCoin, totalCoin };
}

module.exports = {
  calculateRemainingCoin,
  calculateTotalCoin,
  recalculate,
};
