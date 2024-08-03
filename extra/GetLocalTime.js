const getLocalTime = () => {
    return new Date(+new Date()+19800000).toISOString().split('.')[0]
}

module.exports = getLocalTime;