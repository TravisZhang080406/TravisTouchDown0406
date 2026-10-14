import net from 'node:net';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
async function available(port){return new Promise((resolve,reject)=>{const server=net.createServer();server.once('error',e=>e.code==='EADDRINUSE'?resolve(false):reject(e));server.listen(port,'127.0.0.1',()=>server.close(()=>resolve(true)));});}
try{
 let port=3000;
 while(port<=3010 && !await available(port))port++;
 if(port>3010)throw new Error('3000–3010 端口均被占用，请关闭之前的绘本启动窗口后重试。');
 console.log(`\n梦之彼岸正在启动，请等待出现 Ready 后打开：http://127.0.0.1:${port}\n请保持这个窗口打开；停止服务请按 Control+C。\n`);
 const child=spawn(process.execPath,[require.resolve('next/dist/bin/next'),'start','--hostname','127.0.0.1','--port',String(port)],{stdio:'inherit'});
 child.on('exit',code=>process.exit(code??0));
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
}catch(error){console.error(error.message);process.exitCode=1;}
