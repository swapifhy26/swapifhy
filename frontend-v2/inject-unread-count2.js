const fs = require('fs');
let code = fs.readFileSync('../backend/src/controllers/chat.controller.ts', 'utf8');

const mapOld = `return {
                swapId: s.id,
                partnerId: partner.id,
                partnerName: partner.name,
                partnerAvatar: partner.avatarUrl,
                lastMessage: s.messages[0]?.content || "No messages yet",
                status: s.status,
                updatedAt: s.updatedAt,
                isOnline,
                isProposer: s.proposerId === userId
            };`;

const mapNew = `return {
                swapId: s.id,
                partnerId: partner.id,
                partnerName: partner.name,
                partnerAvatar: partner.avatarUrl,
                lastMessage: s.messages[0]?.content || "No messages yet",
                status: s.status,
                updatedAt: s.updatedAt,
                isOnline,
                isProposer: s.proposerId === userId,
                unreadCount: s._count?.messages || 0
            };`;

if (code.includes(mapOld)) {
    code = code.replace(mapOld, mapNew);
    fs.writeFileSync('../backend/src/controllers/chat.controller.ts', code);
    console.log('Successfully injected unreadCount into map return object');
} else {
    console.log('Could not find mapOld string in file');
}
