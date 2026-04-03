import jwt from 'jsonwebtoken';

const authUser = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not Authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({ success: false, message: 'Not Authorized' });
    }

    // ✅ Attach to req, NOT req.body
    req.userId = decoded.id;

    next(); // 🔴 required
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

export default authUser;
