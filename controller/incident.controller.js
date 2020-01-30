const {Incident} = require("../models");

exports.create = async (emails) => {    
    console.log('EMAILS: ', emails)
    emails.map(async (item) => { 
        const incident = new Incident(item)
        return await incident.save();
    });
}