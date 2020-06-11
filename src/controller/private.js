const prismaConn = require('../../prisma/connection')
module.exports = {
    tools: async(req,res)=>{
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
            console.log(error);
            return res.status(403).send({error:'error on search'});
        }
    },
    createTool: async(req,res)=>{
        try {
            const tool = {title,link,description} = req.body;
            const {tags} = req.body
            tool.tags = {create:tags.map(tag => ({name:tag}))}
            const resp = await prismaConn.links.create({
                data:tool,
                include:{
                    tags:{
                        select:{
                            name:true
                        }
                    }
                }
            }); 
            return res.status(201).json(resp);
        } catch (error) {
            console.log(error);
            return res.status(403).send({error:'error on create'});
        }
    },
    deleteTool: async(req,res)=>{
        try {
            const {id} = req.params;
            await prismaConn.tag.deleteMany({where:{idLink:parseInt(id)}})
            await prismaConn.links.delete({where:{id:parseInt(id)}})
            return res.status(204).send();
        } catch (error) {
            console.log(error);
            return res.status(403).send({error:'error on delete'});
        }
    }
}