const Joi=require('joi');


const loginValidation=(req,res,next)=>{
    const schema=Joi.object({
        //ony  email and password required for login so not name
        email:Joi.string().email().required(),
        password:Joi.string().min(6).max(100).required(),
    });

    const{error} =schema.validate(req.body);
    if(error){
        return res.status(400).json({message:"Bad Request Jay",error});
    }
    next(); //proceed to next middleware or controller next function
}

const signupValidation=(req,res,next)=>{
    const schema=Joi.object({
        name: Joi.string().min(3).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(4).max(100).required(),
        // confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        // otp: Joi.string().optional(),
        role: Joi.string().valid('citizen', 'official').required(),
        latitude: Joi.number().optional(),
        longitude: Joi.number().optional()
  });


    const{error} =schema.validate(req.body);
    if(error){
        return res.status(400).json({message:"Bad Request Jay",error});
    }
    next(); //proceed to next middleware or controller next function
}
    



module.exports={
    loginValidation,
    signupValidation
};
    