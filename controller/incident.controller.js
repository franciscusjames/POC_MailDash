const {Incident} = require("../models");

exports.create = async (mail) => {
    console.log('remetente')
    console.log(mail)
    const incident = new Incident(mail)
    console.log(incident)
    return await incident.save();
}