    <script>

        const appConfigs = {
            Bike: {
                appToken: 'd28721be-fd2d-4b45-869e-9f253b554e50',
                promoId: '43e35910-c168-4634-ad4f-52fd764a843f'
            },
            Clone: {
                appToken: '74ee0b5b-775e-4bee-974f-63e7f4d5bacb',
                promoId: 'fe693b26-b342-4159-8808-15e3ff7f8767'
            },
            Chain: {
                appToken: 'd1690a07-3780-4068-810f-9b5bbf2931b2',
                promoId: 'b4170868-cef0-424f-8eb9-be0622e8e8e3'
            },
            Train: {
                appToken: '82647f43-3f87-402d-88dd-09a90025313f',
                promoId: 'c4480ac7-e178-4973-8061-9ed5b2e17954'
            }
        };

        let APP_TOKEN = appConfigs.Bike.appToken;
        let PROMO_ID = appConfigs.Bike.promoId;
        const DEBUG_MODE = false;
        const EVENTS_DELAY = DEBUG_MODE ? 350 : 20000;
        const NUM_KEYS_TO_GENERATE = 4;
        let USER_ID = 'test_id';
        let USER = 'test_user';
        let HASH = 'test_hash';
        
        function updateConstants() {
            const selectedApp = document.getElementById('appSelect').value;
            APP_TOKEN = appConfigs[selectedApp].appToken;
            PROMO_ID = appConfigs[selectedApp].promoId;
        }

        function generateClientId() {
            const timestamp = Date.now();
            const randomNumbers = Array.from({ length: 19 }, () => Math.floor(Math.random() * 10)).join('');
            return `${timestamp}-${randomNumbers}`;
        }

        function generateDeviceId() {
            const baseDeviceId = '00000000000-0000000000000000000';
            const randomDigits = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join('');
            let deviceIdArray = baseDeviceId.split('');
            for (let i = 0; i < randomDigits.length; i++) {
                const randomIndex = Math.floor(Math.random() * deviceIdArray.length);
                deviceIdArray[randomIndex] = randomDigits[i];
            }
            return deviceIdArray.join('');
        }

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async function commitKey(key) {
            const keyData = {
                id: USER_ID,
                user: USER,
                hash: HASH,
                key: key
            };
            const keyDataEncoded = btoa(JSON.stringify(keyData));
            const url = DEBUG_MODE ?
                `http://localhost:7000/key?v=${keyDataEncoded}` :
                `http://176.119.159.166:7000/key?v=${keyDataEncoded}`;
        
            try {
                const response = await fetch(url, { method: 'POST' });
                return await response.json();
            } catch (error) {
                console.error('Error committing key:', error);
                return { status: 'error' };
            }
        }

        async function login(clientId) {
            if (DEBUG_MODE) {
                return `${APP_TOKEN}:deviceid:${deviceId}:${Date.now()}`;
            }
        
            try {
                const response = await fetch('https://api.gamepromo.io/promo/login-client', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        appToken: APP_TOKEN,
                        clientId: clientId,
                        clientOrigin: 'deviceid'
                    })
                });
                const data = await response.json();
                return data.clientToken;
            } catch (error) {
                console.error('Error logging in:', error);
                return null;
            }
        }

        async function emulateProgress(clientToken) {
            if (DEBUG_MODE) {
                return Math.random() < 0.5;
            }
        
            try {
                const response = await fetch('https://api.gamepromo.io/promo/register-event', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${clientToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        promoId: PROMO_ID,
                        eventId: generateClientId(),
                        eventOrigin: 'undefined'
                    })
                });
                const data = await response.json();
                return data.hasCode;
            } catch (error) {
                console.error('Error emulating progress:', error);
                return false;
            }
        }

        async function generateKey(clientToken) {
            if (DEBUG_MODE) {
                return Math.random() < 0.5 ? 'PROMO-3YD-5ZA6-3VJA-Y77' : '';
            }
            try {
                const response = await fetch('https://api.gamepromo.io/promo/create-code', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${clientToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ promoId: PROMO_ID })
                });
                const data = await response.json();
                return data.promoCode;
            } catch (error) {
                console.error('Error generating key:', error);
                return null;
            }
        }
        
        async function generateSingleKey() {
            const clientId = generateClientId();
            const clientToken = await login(clientId);
        
            if (!clientToken) {
                appendToDisplay('Авторизация не выполнена. Пропуск генерации ключа.');
                return null;
            }
        
            appendToDisplay('Авторизация выполнена, ожидайте генерации ключа...');
        
            for (let j = 0; j < 7; j++) {
                if (await emulateProgress(clientToken)) {
                    break;
                }
                await sleep(EVENTS_DELAY);
            }
        
            const key = await generateKey(clientToken);
            if (key) {
                appendToDisplay(`Generated key: ${key}`);
        
                if (USER_ID) {
                    const result = await commitKey(key);
                    if (result.status === 'ok') {
                        appendToDisplay(`Points: ${result.points}`);
                        return key;
                    } else {
                        appendToDisplay('Сгенерированный ключ...');
                        return null;
                    }
                } else {
                    return key;
                }
            } else {
                appendToDisplay('Генерирую следующий ключ...');
                return null;
            }
        }

        async function findValidKeys(numKeys) {
            const keyDisplay = document.getElementById('jsonDataDisplay');
            keyDisplay.style.display = "block";
            keyDisplay.textContent = ''; // Clear previous content
        
            const keyPromises = Array.from({ length: numKeys }, () => generateSingleKey());
            const keys = await Promise.all(keyPromises);
        
            const validKeys = keys.filter(key => key !== null);
            if (validKeys.length > 0) {
                appendToDisplay(`Valid keys found: ${validKeys.join(', ')}`);
            } else {
                appendToDisplay('No valid keys found.');
            }
        }

        function appendToDisplay(text) {
            const keyDisplay = document.getElementById('jsonDataDisplay');
            keyDisplay.textContent += text + '\n';
            keyDisplay.scrollTop = keyDisplay.scrollHeight; // Auto-scroll to bottom
        }
        
        function generateKeys() {
            findValidKeys(NUM_KEYS_TO_GENERATE);
        }
    </script>
