import models from "../models/index.ts";
import db from "../config/db.ts";
import bcrypt from 'bcryptjs';

const ADMIN_CONFIG = {
    user_id: 1,
    user_name: process.env.ADMIN_USERNAME,
    user_email: process.env.ADMIN_EMAIL,
    user_password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
    when_created: new Date(),
    is_admin: true
};

const seedAll = async () => {
    const { User, Group, GroupMembers, Expense } = models;

    await User.bulkCreate([
        ADMIN_CONFIG,
        { user_id: 2, user_name: 'Marcos', user_email: 'marcos@tdbo.com', user_password: await bcrypt.hash('1234', 10), when_created: new Date(), is_admin: false },
        { user_id: 3, user_name: 'Montse', user_email: 'montse@tdbo.com', user_password: await bcrypt.hash('1234', 10), when_created: new Date(), is_admin: false },
        { user_id: 4, user_name: 'Luis', user_email: 'luis@tdbo.com', user_password: await bcrypt.hash('1234', 10), when_created: new Date(), is_admin: false },
        { user_id: 5, user_name: 'jonathan', user_email: 'jonathan@tdbo.com', user_password: await bcrypt.hash('1234', 10), when_created: new Date(), is_admin: false },
        { user_id: 6, user_name: 'Nono', user_email: 'nono@nono.com', user_password: await bcrypt.hash('1234', 10), when_created: new Date(), is_admin: false },
    ], { ignoreDuplicates: true });

    await Group.bulkCreate([
        { group_id: 1, group_name: 'Viaje a Canarias', created_by: 'Luis', trip_starts: '2026-06-01', trip_ends: '2026-07-01' },
    ], { ignoreDuplicates: true });

    await GroupMembers.bulkCreate([
        { group_id: 1, user_id: 2 },
        { group_id: 1, user_id: 3 },
        { group_id: 1, user_id: 4 },
        { group_id: 1, user_id: 5 }
    ], { ignoreDuplicates: true });

    await Expense.bulkCreate([
        { expense_id: 1, group_id: 1, paid_by_user_id: 2, amount: 233, created_at: '2026-06-11', description: 'Hotel' },
        { expense_id: 1, group_id: 1, paid_by_user_id: 3, amount: 89, created_at: '2026-06-13', description: 'Cena' },
        { expense_id: 1, group_id: 1, paid_by_user_id: 4, amount: 377, created_at: '2026-06-13', description: 'Tren' }
    ], { ignoreDuplicates: true });

    await db.query(`SELECT setval(pg_get_serial_sequence('users', 'user_id'), COALESCE((SELECT MAX(user_id) FROM users), 1))`);
}

export default seedAll;