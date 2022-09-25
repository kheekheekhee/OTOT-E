const mongoose = require('mongoose')

const dataSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    ip_address: {
        type: String,
        required: true
    }
})

const Data = mongoose.model("data", dataSchema)
module.exports = Data

module.exports.get = (callback, limit) => {
    Data.find(callback).limit(limit)
}
