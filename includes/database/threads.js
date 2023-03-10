module.exports = function ({ api }) {
    const Users = require("./users")({ api });
    const logger =require("../../utils/log.js");
    const { writeFileSync, readFileSync } = require("fs-extra");
    var path = __dirname + "/data/threadsData.json";

    try {
        var threadsData = require(path)
    } catch {
        writeFileSync(path, "{}", { flag: 'a+' });
    }

    async function getInfo(threadID) {
        try {
            const result = await api.getThreadInfo(threadID);
            return result;
        }
        catch (error) { 
            throw new Error(error);
            return false
        };
    }

    async function getData(threadID, callback) {
        try {
            if (!threadID) throw new Error("threadID không được để trống");
            if (isNaN(threadID)) throw new Error("threadID không hợp lệ");
            if (!threadsData.hasOwnProperty(threadID)) await createData(threadID);
            const data = threadsData[threadID];
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return false
        }
    }

    async function saveData(data) {
        try {
            if (!data) throw new Error('Data không được để trống');
            writeFileSync(path, JSON.stringify(data, null, 4))
        } catch (error) {
            return false
        }
    }
    async function getAll(keys, callback) {
        try {
            if (!keys) {
                if (Object.keys(threadsData).length == 0) return [];
                else if (Object.keys(threadsData).length > 0) {
                    var db = [];
                    for (var i of Object.keys(threadsData)) db.push(threadsData[i]);
                    return db;
                }
            }
            if (!Array.isArray(keys)) throw new Error("Tham số truyền vào phải là 1 array");
            const data = [];
            for (var ID in threadsData) {
                const database = {
                    ID: ID
                };
                const threadData = threadsData[ID];
                for (var i of keys) database[i] = threadData[i];
                data.push(database);
            }
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return false
        }
    }
    async function setData(threadID, options, callback) {
        try {
            if (!threadID) throw new Error("threadID không được để trống");
            if (isNaN(threadID)) throw new Error("threadID không hợp lệ");
            if (!threadsData.hasOwnProperty(threadID)) throw new Error(`Threads mang ID: ${threadID} không tồn tại trong Database`);
            if (typeof options != 'object') throw new Error("Tham số options truyền vào phải là 1 object");
            threadsData[threadID] = {
                ...threadsData[threadID],
                ...options
            }
            await saveData(threadsData);
            if (callback && typeof callback == "function") callback(null, threadsData[threadID]);
            return threadsData[threadID];
        }
        catch(error) {
            if (callback && typeof callback == "function") callback(error, null);
            return false
        }
    }

    async function delData(threadID, callback) {
        try {
            if (!threadID) throw new Error("threadID không được để trống");
            if (isNaN(threadID)) throw new Error("threadID không hợp lệ");
            if (!threadsData.hasOwnProperty(threadID)) throw new Error(`Threads mang ID: ${threadID} không tồn tại trong Database`);
            delete threadsData[threadID];
            await saveData(threadsData);
            if (callback && typeof callback == "function") callback(null, "REMOVE THREAD "+ threadID + " SUCCES");
            return true;
        } catch(error) {
            if (callback && typeof callback == "function") callback(error, null);
            return false
        }
    }

    async function createData(threadID, callback) {
        try {
            if (!threadID) throw new Error("threadID không được để trống");
            if (isNaN(threadID)) throw new Error("threadID không hợp lệ");
            if (threadsData.hasOwnProperty(threadID)) throw new Error(`Threads mang ID: ${threadID} đã tồn tại trong Database`);
            var threadInfo = await api.getThreadInfo(threadID);
            var data = {
                [threadID]: {
                    threadInfo: {
                        threadID: threadID,
                        threadName: threadInfo.threadName,
                        emoji: threadInfo.emoji,
                        adminIDs: threadInfo.adminIDs,
                        participantIDs: threadInfo.participantIDs,
                        isGroup: threadInfo.isGroup,
                    },
                    createTime: {
                        timestamp: Date.now()
                    },
                    data: {
                        timestamp: Date.now()
                    }
                }
            }
            Object.assign(threadsData, data);
            const dataUser = global.data.allUserID
                for (singleData of threadInfo.userInfo) {
                    if(singleData.gender != undefined) {
                        try {
                            if(dataUser.includes(singleData.id) || Users.hasOwnProperty(singleData.id)) continue
                            dataUser.push(singleData.id)
                            await Users.createData(singleData.id)
                            logger(global.getText('handleCreateDatabase', 'newUser', singleData.id), '[ DATABASE ]');
                        } catch(e) { console.log(e) };
                    }
                }
            await saveData(threadsData)
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return false
        }
    }

    return {
        getInfo,
        getAll,
        getData,
        setData,
        delData,
        createData
    };
};