import prisma from './lib/prisma'; prisma.setting.findUnique({ where: { key: 'admin_username' } }).then(console.log).catch(console.error).finally(() => process.exit(0));
