const crypto = require('crypto');
const prismaConn = require('../../prisma/connection');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');

const auth = require('../config/auth.json');
const mailer = require('../util/mail');


const generateToken = (params ={}) =>{
    return JWT.sign(
        params,
        auth.secret,
        {
            expiresIn:86400
        }
       );
}

module.exports = {
    register: async (req,res)=>{
        try {
            let user = req.body;
            user.password = await bcrypt.hash(user.password,10);
            const userId =  await prismaConn.users.create({
                data:user,select:id
            })
            res.header("X-TOKEN",generateToken({userId}));
            return res.json({userId});
        } catch (err) {
            res.status(401).send(err)
        }
        
    },
    login: async (req,res)=>{
        try {
            const {email,password} = req.body;
            let data = await prismaConn.users.findOne({
                where:{email:email}
            });

            if(!data)
                return res.status(400).send({error:"User not found"});

            if(!await bcrypt.compare(password,data.password))
                return res.status(401).send({error:"incorrect passoword!"});

            data.password = undefined;
            data.password_reset_token = undefined;
            data.password_reset_expiries = undefined;
            const token = generateToken({id:data.id});
            data.token = token;
            
            res.header("X-TOKEN",token);
            return res.json(data)
        } catch (error) {
            console.log(error)
            return res.status(500).json({error:'problem on data base connection'});
        }
        

    },
    forgotPassword: async (req,res)=>{
        try {
            const {email} = req.body;
            const user = await prismaConn.users.findOne({
                where:{email:email}
            });
           
            if(!user)
                return res.status(401).send({error:'Not exists user whit this email'});
            
            const token = crypto.randomBytes(20).toString('hex');
            const now = new Date();
            now.setHours(now.getHours() +1);

            await connection('users')
            .where('email',email)
            .update({
                'password_reset_token':token,
                'password_reset_expiries':now
            });
            
            const resEmail =  await mailer.sendMail({
                from: process.env.MAIL_FROM,
                to: email,
                subject: 'Recuperação de senha',
                template:'auth/forgotPassword',
                context:{token}
            }); 
            
            return res.json({resEmail});
            
        } catch (error) {
            return res.status(401).send({error});
        }

        
    },
    resetPassword:async(req,res)=>{
        const {email,token,password} = req.body;
        const user = await prismaConn.users.findOne({
            where:{email:email}
        });
            
        if(!user)
            return res.status(401).send({error:'Not exists user whit this email'});
        if(token!== user.password_reset_token)
            return res.status(401).send({error:'Token is not valid.'});
        if(new Date() > user.password_reset_expiries)
            return res.status(401).send({error:'Token expiries'});

        const passwordCrypted = await bcrypt.hash(password,10);
        await connection('users')
            .where('email',email)
            .update({
                password : passwordCrypted
            });
        return res.send();
        
    }
}
