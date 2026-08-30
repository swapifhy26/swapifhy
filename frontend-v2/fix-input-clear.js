const fs = require('fs');
let code = fs.readFileSync('src/components/ChatPanel.tsx', 'utf8');

const targetStr = `            if (res.ok) { setInputText(""); fetchData(); }
        } catch (err) { console.error(err); }`;

const newStr = `            if (res.ok) { 
                setInputText(""); 
                fetchData(); 
            } else {
                setInputText(""); 
                fetchData();
            }
        } catch (err) { console.error(err); }`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, newStr);
    fs.writeFileSync('src/components/ChatPanel.tsx', code);
    console.log("Fixed input clearing on failed message");
} else {
    console.log("Could not find targetStr");
}
