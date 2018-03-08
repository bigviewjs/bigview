const { changeStatus } = require('./const');
const { CHANGING, CHANGE_DONE} = changeStatus;

module.exports = function(pagelet) {
    let data = {
      a:1
    };

    return Promise.resolve(data);
};
