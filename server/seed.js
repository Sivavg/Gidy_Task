const axios = require('axios');

const generateLogs = () => {
    const logs = [];
    const actors = ['priya.nair@company.com', 'john.doe@company.com', 'admin.sys@company.com', 'audit.service@company.com', 'jane.smith@company.com'];
    const roles = ['admin', 'user', 'moderator', 'system', 'auditor'];
    const actions = ['DELETE_USER', 'LOGIN', 'LOGOUT', 'UPDATE_POLICY', 'READ_DOCUMENT', 'EXPORT_DATA', 'UPDATE_USER', 'CREATE_USER'];
    const resourceTypes = ['USER', 'DOCUMENT', 'SYSTEM', 'POLICY', 'REPORT'];
    const regions = ['ap-south-1', 'us-east-1', 'us-west-2', 'eu-central-1'];
    const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const statuses = ['Resolved', 'Unresolved', 'In Progress'];
    
    for (let i = 0; i < 10000; i++) {
        logs.push({
            actor: actors[Math.floor(Math.random() * actors.length)],
            role: roles[Math.floor(Math.random() * roles.length)],
            action: actions[Math.floor(Math.random() * actions.length)],
            resource: `/api/${resourceTypes[Math.floor(Math.random() * resourceTypes.length)].toLowerCase()}s/${Math.floor(Math.random() * 1000)}`,
            resourceType: resourceTypes[Math.floor(Math.random() * resourceTypes.length)],
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            region: regions[Math.floor(Math.random() * regions.length)],
            severity: severities[Math.floor(Math.random() * severities.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString() // Random time in the last 30 days
        });
    }
    return logs;
};

const uploadLogs = async () => {
    console.log('Generating 10,000 logs...');
    const logs = generateLogs();
    
    console.log('Uploading logs...');
    try {
        const response = await axios.post('http://localhost:5000/api/logs/bulk', { logs }, {
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error uploading logs:', error.response ? error.response.data : error.message);
    }
};

uploadLogs();
