const {Incident} = require("../models");

exports.create = async (mail) => {
    const incident = new Incident(mail)
    return await incident.save();
}