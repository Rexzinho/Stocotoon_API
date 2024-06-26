require("dotenv").config();
const jwt = require("jsonwebtoken");
const Page = require("../models/Page");
const Chapter = require("../models/Chapter");

module.exports = async function checkTokenByPage(req, res, next){

    const PageId = req.body.PageId;

    if(!PageId){
        return res.status(400).json({
            message: "PageId necessário."
        })
    }

    //check if chapter exists
    const page = await Page.findOne({where: {id: PageId}});
    if(!page){
        return res.status(404).json({
            message: "Page não encontrado."
        });
    }

    // get UserId
    const ChapterId = page.ChapterId;
    const chapter = await Chapter.findOne({where: {id: ChapterId}});
    const UserId = chapter.UserId;

    // check if token and UserId match
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token){
        return res.status(401).json({
            message: "Acesso negado"
        });
    }

    try {
        const secret = process.env.SECRET;
        jwt.verify(token, secret, async (err, decodedToken) => {
            if (err) {
                return res.status(400).json({
                    message: "Token inválido."
                });
            }

            if (decodedToken.id !== UserId) {
                return res.status(400).json({
                    message: "Token de usuário inválido."
                });
            }
            else{
                next();
            }
        });

    } catch (error) {
        res.status(400).json({
            message: "Token inválido."
        })
    }
}