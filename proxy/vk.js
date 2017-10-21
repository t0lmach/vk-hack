const config = require('config'),
    https = require('https'),
    VK = require('node-vkapi'),
    idownload = require('image-downloader'),
    fs = require('fs');


const group_token = config.get('group_token');
const token = '3142e21daf7c5de5f7';
const vk = new VK({
    accessToken: group_token
});

const mkdirSync = function (dirPath) {
    try {
        fs.mkdirSync(dirPath)
    } catch (err) {
        if (err.code !== 'EEXIST') throw err
    }
};

const writeFileSync = function (path, file) {
    try {
        fs.writeFileSync(path, file)
    } catch (err) {
        if (err.code !== 'EEXIST') throw err
    }
};

const makeuserInfo = function (user) {
    res = user.first_name + " " + user.last_name;
    if (user.bdate) {
        res += "\nBirthday: " + user.bdate;
    }
    if (user.city) {
        res += "\nCity: " + user.city.title;
    }

    if (user.activities) {
        res += "\nДеятельность: " + user.activities;
    }
    if (user.about) {
        res += "\nО себе: " + user.about;
    }
    return res.toString('Unicode');
};

module.exports =
    {
        makeUserMessage: function (id) {
            //vk.call('messages.send', {'user_id':35200048, 'message':'Дарова пидор'}

            return vk.call('users.get', {'user_ids': id, 'fields': 'photo_id,city,about,bdate,activities'})
                .then(response => {
                    let user = response[0];
                    console.log(user);
                    let card = makeuserInfo(user)
                    return {'message': card, 'attachment': 'photo' + user.photo_id}

                }).catch(error => console.error(error));

        },
        sendNotifications: function (id1, id2) {
            let card1 = this.makeUserMessage(id1);
            let card2 = this.makeUserMessage(id2);
            Promise.all([card1.then(card => vk.call('messages.send', {
                'user_id': id2,
                'message': card.message,
                'attachment': card.attachment
            })),
                card2.then(card => vk.call('messages.send', {
                    'user_id': id1,
                    'message': card.message,
                    'attachment': card.attachment
                }))])
                .then(res => console.log(res)).catch(err => console.error(err))
        }
    };

