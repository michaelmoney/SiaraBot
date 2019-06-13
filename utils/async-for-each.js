const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) { // eslint-disable-line no-plusplus
        await callback(array[index], index, array); // eslint-disable-line no-await-in-loop
    }
};

module.exports = asyncForEach;
