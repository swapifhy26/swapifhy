const fs = require('fs');
let code = fs.readFileSync('../backend/src/controllers/chat.controller.ts', 'utf8');

const targetInclude = `messages: { orderBy: { createdAt: 'desc' }, take: 1 },`;
const newInclude = `messages: { orderBy: { createdAt: 'desc' }, take: 10 },`;

if (code.includes(targetInclude)) {
    code = code.replace(targetInclude, newInclude);
} else {
    console.log("Could not find take: 1");
}

const targetMap = `return {
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

const newMap = `
              const validMessages = s.messages.filter(m => !(m.senderId.startsWith("SYSTEM_WARNING") && m.senderId !== \`SYSTEM_WARNING_\${userId}\`));
              return {
                swapId: s.id,
                partnerId: partner.id,
                partnerName: partner.name,
                partnerAvatar: partner.avatarUrl,
                lastMessage: validMessages[0]?.content || "No messages yet",
                status: s.status,
                updatedAt: s.updatedAt,
                isOnline,
                isProposer: s.proposerId === userId,
                unreadCount: s._count?.messages || 0
            };`;

if (code.includes(targetMap)) {
    code = code.replace(targetMap, newMap);
    fs.writeFileSync('../backend/src/controllers/chat.controller.ts', code);
    console.log("Updated getConversations to hide warning from receiver's preview");
} else {
    console.log("Could not find target map");
}
