const router = require('express').Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwtGenerator = require('../utils/jwtGenerator');
const validInfo = require('../middleware/validInfo');
const authorization = require('../middleware/authorization');

//register
router.post("/register", validInfo, async (req, res) => {
    try {
        //1. destructure the req.body(name, email, password)

        const { name, email, password } = req.body;

        //2. check if user exist (if user exist then throw error)

        const user = await pool.query("SELECT * FROM users WHERE user_email = $1",
            [email]);

        if (user.rows.length !== 0) {
            return res.status(401).send("User existed")
        }

        //3. Bcrypt the user password

        const salt = await bcrypt.genSalt(10);
        const bcryptPassword = await bcrypt.hash(password, salt);

        //4. enter the new user inside db

        const newUser = await pool.query
            ("INSERT INTO users (user_name, user_email, user_password) VALUES ($1, $2, $3) RETURNING *",
                [name, email, bcryptPassword]);

        //res.json(newUser.rows[0]);
        //5. generating jwt token

        const token = jwtGenerator(newUser.rows[0].user_id);

        res.json({ token });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("server error");
    }
});

//login
router.post('/login', validInfo, async (req, res) => {
    try {

        //1. destructure the req.body(name, email, password)

        const { email, password } = req.body;
        
        //2. check if user doesn't exist (if not then throw error)

        const user = await pool.query("SELECT * FROM users WHERE user_email = $1",
            [email]);

        if (user.rows.length === 0) {
            return res.status(401).json("Password or email is incorrect");
        }

        //3. check if incoming pass == database pass

        const validPassword = await bcrypt.compare(password, user.rows[0].user_password);

        if (!validPassword) {
            return res.status(401).json("Password or email is incorrect");
        }

        //4. give the jwt token

        const token = jwtGenerator(user.rows[0].user_id);

        return res.json({ token });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("server error");
    }
});

router.get('/verify', authorization, async (req, res) => {
    try {
        res.json(true);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("server error");
    }
})

module.exports = router;

