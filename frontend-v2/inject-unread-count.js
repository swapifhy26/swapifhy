const fs = require('fs');
let code = fs.readFileSync('../backend/src/controllers/chat.controller.ts', 'utf8');

// Inject unreadCount query into getConversations
// Currently it fetches messages. Let's add unreadCount via a separate query since Prisma include doesn't easily do conditional _count with where inside a map without a join.
// Actually, Prisma supports it!
// messages: { orderBy: { createdAt: 'desc' }, take: 1 }, _count: { select: { messages: { where: { senderId: { not: userId }, isRead: false } } } }
const getConversationsOld = `            include: {
                proposer: { select: { id: true, name: true, avatarUrl: true } },
                receiver: { select: { id: true, name: true, avatarUrl: true } },
                messages: { orderBy: { createdAt: 'desc' }, take: 1 }
            },`;
const getConversationsNew = `            include: {
                proposer: { select: { id: true, name: true, avatarUrl: true } },
                receiver: { select: { id: true, name: true, avatarUrl: true } },
                messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                _count: {
                    select: {
                        messages: { where: { senderId: { not: userId }, isRead: false } }
                    }
                }
            },`;

if (code.includes(getConversationsOld)) {
    code = code.replace(getConversationsOld, getConversationsNew);
} else {
    console.log("Could not find getConversationsOld");
}

const mapOld = `return {
                id: s.id,
                status: s.status,
                isProposer: s.proposerId === userId,
                partner: {
                    id: partner.id,
                    name: partner.name,
                    avatarUrl: partner.avatarUrl,
                    isOnline
                },
                lastMessage: s.messages[0] ? s.messages[0].content : null,
                lastMessageTime: s.messages[0] ? s.messages[0].createdAt : s.updatedAt
            };`;
            
const mapNew = `return {
                id: s.id,
                status: s.status,
                isProposer: s.proposerId === userId,
                partner: {
                    id: partner.id,
                    name: partner.name,
                    avatarUrl: partner.avatarUrl,
                    isOnline
                },
                lastMessage: s.messages[0] ? s.messages[0].content : null,
                lastMessageTime: s.messages[0] ? s.messages[0].createdAt : s.updatedAt,
                unreadCount: s._count?.messages || 0
            };`;

if (code.includes(mapOld)) {
    code = code.replace(mapOld, mapNew);
} else {
    console.log("Could not find mapOld");
}

fs.writeFileSync('../backend/src/controllers/chat.controller.ts', code);
console.log('Updated getConversations in chat.controller.ts');
