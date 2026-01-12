// backend/src/routes/groups.js
import express from 'express';
import jwt from 'jsonwebtoken';
import Group from '../models/Group.js';
import Expense from '../models/Expense.js';
import User from '../models/User.js';
import Message from '../models/Message.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'verysecretkey';

// Middleware xác thực
const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error('TOKEN AUTHENTICATION ERROR:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// ... (Các route khác như add-member, create group, join, add expense... giữ nguyên)
// ...

// TẠO GROUP MỚI
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const group = new Group({ name, owner: req.userId, members: [req.userId] });
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// THÊM BẠN VÀO NHÓM
router.post('/:id/add-member', auth, async (req, res) => {
  try {
    const friendEmail = req.body.email.trim();
    const userToAdd = await User.findOne({ email: new RegExp('^' + friendEmail + '$', 'i') });

    if (!userToAdd) {
      return res.status(404).json({ message: "Không tìm thấy người dùng với email này" });
    }

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Không tìm thấy nhóm." });
    }
    if (group.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: "Người dùng này đã ở trong nhóm." });
    }
    group.members.push(userToAdd._id);
    await group.save();
    res.status(200).json({ message: "Thêm thành viên thành công", group });
  } catch (err) {
    console.error("LỖI 500 BÊN TRONG ROUTE ADD-MEMBER:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// THÊM CHI TIÊU
router.post('/:id/expenses', auth, async (req, res) => {
  try {
    const { title, amount, paidBy, splits, date } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group || !group.members.includes(req.userId))
      return res.status(403).json({ msg: 'No access' });

    const expense = new Expense({ group: group._id, title, amount, paidBy, splits, date: date ? new Date(date) : undefined });
    await expense.save();
    res.json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// LẤY DANH SÁCH NHÓM CỦA USER
router.get("/", auth, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.userId }).populate("members", "name email");
    res.json(groups);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// LẤY CHI TIẾT NHÓM
router.get("/:id", auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate("members", "name");
    if (!group) return res.status(404).json({ msg: "Không tìm thấy nhóm" });
    res.json(group);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// LẤY DANH SÁCH CHI TIÊU CỦA NHÓM
router.get("/:id/expenses", auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.id }).populate("paidBy", "name");
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// LẤY LỊCH SỬ TIN NHẮN CỦA NHÓM
router.get("/:id/messages", auth, async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.id })
      .populate("sender", "name")
      .sort({ createdAt: "asc" });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ TÍNH TOÁN VÀ TỔNG KẾT CÔNG NỢ (CHỈ GIỮ LẠI ROUTE NÀY)
router.get("/:id/summary", auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.id });
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ msg: "Không tìm thấy nhóm" });

    // 1. Tính toán số dư của mỗi người
    const balances = {};
    group.members.forEach(memberId => {
      balances[memberId.toString()] = 0;
    });

    expenses.forEach(expense => {
      const paidBy = expense.paidBy.toString();
      const amount = expense.amount;
      const numMembersInExpense = expense.splits.length;
      if (numMembersInExpense === 0) return;
      
      const share = amount / numMembersInExpense;

      balances[paidBy] += amount;

      expense.splits.forEach(split => {
        const memberId = split.userId.toString();
        balances[memberId] -= share;
      });
    });

    // 2. Tách ra người nợ và người được trả
    const debtors = [];
    const creditors = [];

    Object.keys(balances).forEach(userId => {
      if (balances[userId] < 0) {
        debtors.push({ userId, amount: balances[userId] });
      } else if (balances[userId] > 0) {
        creditors.push({ userId, amount: balances[userId] });
      }
    });

    // 3. Đơn giản hóa các giao dịch
    const settlements = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amountToSettle = Math.min(-debtor.amount, creditor.amount);

      settlements.push({ from: debtor.userId, to: creditor.userId, amount: amountToSettle });

      debtor.amount += amountToSettle;
      creditor.amount -= amountToSettle;

      if (debtor.amount > -0.01) i++;
      if (creditor.amount < 0.01) j++;
    }
    
    // Populate thông tin user cho frontend
    const populatedSettlements = await Promise.all(
        settlements.map(async (s) => ({
            from: await User.findById(s.from).select('name'),
            to: await User.findById(s.to).select('name'),
            amount: s.amount,
        }))
    );

    res.json(populatedSettlements);
  } catch (err) {
    console.error("Lỗi tính toán summary:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ XÓA MỘT CHI TIÊU
router.delete("/:groupId/expenses/:expenseId", auth, async (req, res) => {
  try {
    const { groupId, expenseId } = req.params;

    // 1. Kiểm tra xem người dùng có phải là thành viên của nhóm không
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(req.userId)) {
      return res.status(403).json({ msg: "Bạn không có quyền thực hiện hành động này." });
    }

    // 2. Tìm và xóa chi tiêu
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ msg: "Không tìm thấy chi tiêu." });
    }

    // Đảm bảo chi tiêu này thuộc về đúng nhóm (tăng cường bảo mật)
    if (expense.group.toString() !== groupId) {
        return res.status(403).json({ msg: "Hành động không hợp lệ." });
    }

    await expense.deleteOne(); // Dùng deleteOne() thay vì remove() (cú pháp mới)

    res.json({ msg: "Xóa chi tiêu thành công." });
  } catch (err) {
    console.error("Lỗi xóa chi tiêu:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ XÓA MỘT NHÓM VÀ TẤT CẢ DỮ LIỆU LIÊN QUAN
router.delete("/:id", auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ msg: "Không tìm thấy nhóm." });
    }

    // ⭐ KIỂM TRA BẢO MẬT: Chỉ chủ nhóm mới có quyền xóa
    if (group.owner.toString() !== req.userId) {
      return res.status(403).json({ msg: "Bạn không có quyền xóa nhóm này." });
    }

    // Xóa nhóm
    await group.deleteOne();

    // Xóa tất cả các chi tiêu liên quan
    await Expense.deleteMany({ group: req.params.id });

    // Xóa tất cả các tin nhắn liên quan
    await Message.deleteMany({ group: req.params.id });

    res.json({ msg: "Xóa nhóm thành công." });

  } catch (err) {
    console.error("Lỗi xóa nhóm:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;