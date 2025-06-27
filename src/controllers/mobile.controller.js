const { getAllSessions } = require('../models/sessionModel');
const { findParticipationTypesByEventId } = require('../models/participation.type.model');
const { findUsersByEventId, findUsersByParticipationType } = require('../models/eventAttendee.model');
const { findSponsorTypesByEventId } = require('../models/sponsor.types.model');
const { getSponsorsByEvent } = require('../models/sponsor.model');
const { findExhibitorTypesByEventId } = require('../models/exhibitor.type.model');
const { getExhibitorsByEvent } = require('../models/exhibitor.model');
const { getNewsPostsByEvent } = require('../models/news.post.model');

const isIdValid = (id) => {
    return !isNaN(parseInt(id)) && parseInt(id) > 0;
};

exports.getEventData = async (req, res) => {
    const { eventId } = req.query;

    if (!eventId || !isIdValid(eventId)) {
        return res.status(400).json({ message: "Valid event ID is required" });
    }

    try {
        // 1. Get 3 sessions by event id
        const sessions = await getAllSessions(parseInt(eventId), 3);

        // 2. Get participation types and attendees
        const participationTypes = await findParticipationTypesByEventId(eventId);

        // Find speaker participation type
        const speakerParticipationType = participationTypes.find(pt => 
            pt.groupParticipationName && /speaker/i.test(pt.groupParticipationName)
        );

        let attendees = {};
        if (speakerParticipationType) {
            // Get attendees with speaker participation type (max 5)
            const speakerAttendees = await findUsersByParticipationType(eventId, speakerParticipationType.id, 5);
            
            attendees = {
                title: speakerParticipationType.groupParticipationName,
                list: speakerAttendees.map(ea => ({
                    ...ea.user,
                    groupParticipationName: speakerParticipationType.groupParticipationName
                }))
            };
        } else {
            // Get attendees of any participation type (max 5)
            const allEventAttendees = await findUsersByEventId(eventId, 5);
            
            // Group by participation type
            const groupedAttendees = {};
            allEventAttendees.forEach(ea => {
                const title = ea.participationType ? ea.participationType.groupParticipationName : 'Other';
                if (!groupedAttendees[title]) {
                    groupedAttendees[title] = [];
                }
                groupedAttendees[title].push({
                    ...ea.user,
                    groupParticipationName: title
                });
            });

            // Get the first group (most common or first in the list)
            const firstGroup = Object.keys(groupedAttendees)[0];
            attendees = {
                title: firstGroup,
                list: groupedAttendees[firstGroup]
            };
        }

        // 3. Get 5 sponsors by event
        const sponsors = await getSponsorsByEvent(eventId, 5);

        // 4. Get 5 exhibitors by event
        const exhibitors = await getExhibitorsByEvent(eventId, 5);

        // 5. Get 3 news posts
        const newsPosts = await getNewsPostsByEvent(parseInt(eventId), 0, 3);
        const limitedNewsPosts = newsPosts.map(post => ({
            id: post.id,
            images: post.images || null,
            description: post.description || null
        }));

        res.status(200).json({
            message: "Event data retrieved successfully",
            data: {
                sessions,
                attendees,
                sponsors,
                exhibitors,
                newsPosts: limitedNewsPosts
            }
        });

    } catch (error) {
        console.error("Get event data error:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
}; 