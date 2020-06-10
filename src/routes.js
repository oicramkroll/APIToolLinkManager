const {celebrate,Segments,Joi} = require('celebrate');
const routes = require('express').Router();
const controller = {
    authenticate: require('./controller/authenticate'),
    private: require('./controller/private'),
    public: require('./controller/public')
};
const auth = require('./middlewares/auth');

routes.post('/auth/register',controller.authenticate.register);
routes.post('/auth/authenticate',controller.authenticate.login);
routes.post('/auth/forgotpassword',controller.authenticate.forgotPassword);
routes.post('/auth/resetpassword',controller.authenticate.resetPassword);

const privateConfig = celebrate({
    [Segments.HEADERS]:Joi.object({
        authorization: Joi.string().required()
    }).unknown()
});

routes.get('/tools/:tag?',privateConfig,auth,controller.private.tools);
routes.post('/tools',privateConfig,auth,controller.private.createTool);
routes.delete('/tools/:id',privateConfig,auth,controller.private.deleteTool);
routes.get('/link/:id',controller.public.getLink);
routes.get('/links/:tag?',controller.public.getAllLinks);

routes.get('/',controller.public.home);



module.exports = routes;