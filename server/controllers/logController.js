const Log = require('../models/Log');

exports.bulkUploadLogs = async (req, res) => {
    try {
        const logs = req.body.logs;
        if (!logs || !Array.isArray(logs)) {
            return res.status(400).json({ error: 'Invalid payload, expected { logs: [...] }' });
        }
        
        if (logs.length > 10000) {
            return res.status(400).json({ error: 'Maximum 10,000 logs allowed per request' });
        }

        // Insert logs in bulk
        await Log.insertMany(logs);
        
        res.status(201).json({ message: `${logs.length} logs successfully inserted` });
    } catch (error) {
        console.error('Bulk upload error:', error);
        res.status(500).json({ error: 'Failed to upload logs' });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search = '',
            severity,
            status,
            role,
            startDate,
            endDate,
            sortBy = 'timestamp',
            sortOrder = 'desc'
        } = req.query;

        const query = {};

        // Search logic (across multiple fields)
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { actor: searchRegex },
                { action: searchRegex },
                { resource: searchRegex },
                { ipAddress: searchRegex }
            ];
        }

        // Filters
        if (severity) query.severity = severity;
        if (status) query.status = status;
        if (role) query.role = role;
        
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        // Pagination setup
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        // Sorting
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const logs = await Log.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);

        const total = await Log.countDocuments(query);

        res.status(200).json({
            data: logs,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Fetch logs error:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
};
