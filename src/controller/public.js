const prismaConn = require('../../prisma/connection');
module.exports = {
    home:(req,res)=>{
        res.json({ok:`Gerenciador de links. para mais detalhes acesse: ${process.env.GIT_URL}`})
    },
    getLink: async (req,res)=>{
        try {
            const {id} = req.params;
            const result = await prismaConn.links.findOne({where:{id:parseInt(id)}});
            return res.json(result.link);
        } catch (error) {
            console.log(error);
            return res.status(403).send({error:'link not Found or invalid parameters'});
        }
        
    },
    getAllLinks: async (req,res)=>{
        try{
            const  {tag}= req.query;
            const links = await prismaConn.links.findMany({
                where: tag && {
                    tags:{
                        some:{name:tag},
                    }
                },
                include:{
                    tags:{
                        select:{
                            name:true
                        }
                    }
                }
            })
            return res.json(links);
        } catch (error) {
            console.log("### error prisma ###");
            console.log({error});
            return res.status(403).send({error:'link not Found or invalid parameters'});
        }
    }
}