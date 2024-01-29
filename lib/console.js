/**
 * Custom logger
 * @param {string} msg
 */
const log = (msg) => {
    console.log("\x1b[36m[Newwy]\x1b[0m " + msg);
  };
  
  /**
   * Error logging
   * @param {string} msg
   */
  const error = (msg) => {
    console.log("\x1b[31m[Error]\x1b[0m " + msg);
  };
  
  export { log, error };
  