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
            const userMail = await prismaConn.users.findOne({
                where:{
                    email:user.email
                }
            });
            if(userMail) 
                return res.status(403).send({error:"Exist a user with this email"});

            user.password = await bcrypt.hash(user.password,10);
            const {id} =  await prismaConn.users.create({
                data:user
            });
            res.header("X-TOKEN",generateToken({id}));
            return res.json({id});
        } catch (err) {
            console.log(error)
            res.status(401).send({error:"error on register user"})
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
            
            res.header("X-TOKEN",generateToken({id:data.id}));
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
            await prismaConn.users.update({
                where:{
                    email:email
                },
                data:{
                    password_reset_expiries:now,
                    password_reset_token:token
                }
            });
            
            const resEmail =  await mailer.sendMail({
                from: process.env.MAIL_FROM,
                to: email,
                subject: 'Recuperação de senha',
                template:'auth/forgotPassword',
                context:{token}
            }); 
            
            return res.send();
            
        } catch (error) {
            return res.status(401).send({error:error.response});
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
        await prismaConn.users.update({
            where:{
                email:email
            },
            data:{
                password:passwordCrypted
            }
        })
       
        return res.send();
        
    }
}
