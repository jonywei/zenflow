import { NestFactory } from '@nestjs/core';
import { Module, Controller, Post, Body, Res, Get, UseInterceptors, UploadedFile, Headers, UnauthorizedException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';
import axios from 'axios';
import * as Database from 'better-sqlite3';
import { diskStorage } from 'multer';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import * as https from 'https';
import { CONFIG } from './config';

if (!fs.existsSync(CONFIG.UPLOAD_DIR)) fs.mkdirSync(CONFIG.UPLOAD_DIR, { recursive: true });
const db = new Database(CONFIG.DB_PATH);
db.pragma('journal_mode = WAL');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

function getUser(authHeader: string) {
    if (!authHeader) throw new UnauthorizedException('未登录');
    const token = authHeader.split(' ')[1];
    try { return jwt.verify(token, CONFIG.JWT_SECRET); } catch (e) { throw new UnauthorizedException('会话过期'); }
}

@Controller('api')
class AppController {
    
    // --- 黄金接口 (探数API) ---
    @Get('tools/gold-price')
    async getGoldPrice(@Res() res: Response) {
        try {
            const apiKey = '34f62086a2c8be1ecd2a1e4283c2aa19'; 
            const apiUrl = 'https://api.tanshuapi.com/api/gold/v1/shgold2?key=' + apiKey;

            console.log('[API Start] Requesting Gold Price...');

            const response = await axios.get(apiUrl, { 
                timeout: 8000,
                httpsAgent: httpsAgent 
            });
            const result = response.data;

            if (result.code !== 1 || !result.data || !result.data.list) {
                console.error('[API Error]', JSON.stringify(result));
                throw new Error('API returns invalid data');
            }

            const list = result.data.list;
            // 核心品种
            const targets = ['Au9999', 'Au9995', 'Au100g', 'PT9995'];
            
            const data = targets.map(code => {
                const item = list[code] || {};
                // 处理时间字符串
                let timeStr = '-';
                if (item.updatetime) {
                    const parts = item.updatetime.split(' ');
                    if (parts.length > 1) timeStr = parts[1];
                }

                return {
                    name: item.typename || code,
                    price: item.price || '0.00',
                    change: item.changepercent || '0.00%',
                    max: item.maxprice || '-',
                    min: item.minprice || '-',
                    time: timeStr
                };
            });

            console.log('[API Success] Data fetched');
            res.json({ success: true, data: data });

        } catch (error) {
            console.error('[API Failed]', error.message);
            res.json({ success: false, msg: error.message, data: [] });
        }
    }

    // --- 核心业务接口 ---
    @Post('auth/login') login(@Body() body) { const { username, password } = body; const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username); if (!user || !bcrypt.compareSync(password, user.password)) return { status: 'error', msg: '账号或密码错误' }; const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, CONFIG.JWT_SECRET, { expiresIn: '7d' }); return { status: 'ok', token, user: { username: user.username, company: user.company_name, phone: user.phone } }; }
    @Post('auth/register') register(@Body() body) { try { const hash = bcrypt.hashSync(body.password, 10); db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(body.username, hash); return { status: 'ok' }; } catch (e) { return { status: 'error', msg: 'User exists' }; } }
    @Post('user/update') updateUser(@Body() body, @Headers('authorization') auth) { const u:any=getUser(auth); if(body.password) db.prepare('UPDATE users SET password=? WHERE id=?').run(bcrypt.hashSync(body.password,10),u.id); db.prepare('UPDATE users SET phone=?, company_name=? WHERE id=?').run(body.phone,body.company_name,u.id); return {status:'ok'}; }
    
    // CRUD
    @Get('company/list') getCompanies(@Headers('authorization') auth) { return { data: db.prepare('SELECT * FROM companies WHERE user_id=?').all((getUser(auth) as any).id) }; }
    @Post('company/save') saveCompany(@Body() body, @Headers('authorization') auth) { db.prepare('INSERT INTO companies (user_id,name,abbr,tax,address,contact,phone,bank,account) VALUES (?,?,?,?,?,?,?,?,?)').run((getUser(auth) as any).id, body.name, body.abbr, body.tax, body.address, body.contact, body.phone, body.bank, body.account); return { status: 'ok' }; }
    @Post('company/delete') deleteCompany(@Body() body, @Headers('authorization') auth) { db.prepare('DELETE FROM companies WHERE id=? AND user_id=?').run(body.id, (getUser(auth) as any).id); return { status: 'ok' }; }
    @Get('personal/list') getPersonals(@Headers('authorization') auth) { return { data: db.prepare('SELECT * FROM personals WHERE user_id=?').all((getUser(auth) as any).id) }; }
    @Post('personal/save') savePersonal(@Body() body, @Headers('authorization') auth) { db.prepare('INSERT INTO personals (user_id,type,name,bank,account,qr_url) VALUES (?,?,?,?,?,?)').run((getUser(auth) as any).id, body.type, body.name, body.bank, body.account, body.qr_url); return { status: 'ok' }; }
    @Post('personal/delete') deletePersonal(@Body() body, @Headers('authorization') auth) { db.prepare('DELETE FROM personals WHERE id=? AND user_id=?').run(body.id, (getUser(auth) as any).id); return { status: 'ok' }; }
    @Get('link/list') getLinks(@Headers('authorization') auth) { return { data: db.prepare('SELECT * FROM links WHERE user_id=?').all((getUser(auth) as any).id) }; }
    @Post('link/save') saveLink(@Body() body, @Headers('authorization') auth) { db.prepare('INSERT INTO links (user_id,name,url) VALUES (?,?,?)').run((getUser(auth) as any).id, body.name, body.url); return { status: 'ok' }; }
    @Post('link/delete') deleteLink(@Body() body, @Headers('authorization') auth) { db.prepare('DELETE FROM links WHERE id=? AND user_id=?').run(body.id, (getUser(auth) as any).id); return { status: 'ok' }; }
    
    // Tools
    @Post('tools/shorten') shorten(@Body() body) { const k=Math.random().toString(36).substr(2,6); db.prepare('INSERT INTO short_links (key,original_url) VALUES (?,?)').run(k,body.url); return {shortUrl: 'http://localhost:' + CONFIG.PORT + '/s/' + k}; }
    
    // ✅ 修复后的上传接口 (移除复杂嵌套)
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: CONFIG.UPLOAD_DIR,
            filename: (req, file, cb) => {
                // 简单字符串拼接，防止语法错误
                const name = Date.now() + '-' + file.originalname;
                cb(null, name);
            }
        })
    }))
    uploadFile(@UploadedFile() file) {
        return { url: 'http://localhost:' + CONFIG.PORT + '/uploads/' + file.filename };
    }
}

@Module({ controllers: [AppController] }) class AppModule {}

async function bootstrap() { 
    const app = await NestFactory.create(AppModule); 
    app.enableCors(); 
    const adapter = app.getHttpAdapter().getInstance(); 
    adapter.use('/uploads', require('express').static(CONFIG.UPLOAD_DIR)); 
    adapter.use('/', require('express').static(CONFIG.CLIENT_DIR)); 
    adapter.get('/s/:key', (req, res) => { 
        const l:any = db.prepare('SELECT original_url FROM short_links WHERE key=?').get(req.params.key); 
        res.redirect(l ? l.original_url : '/'); 
    }); 
    await app.listen(CONFIG.PORT); 
}
bootstrap();
