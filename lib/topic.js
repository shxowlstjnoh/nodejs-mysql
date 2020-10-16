var url = require('url');
var qs = require('querystring');
var db = require('./db');
var template = require('./template.js');
var sanitized = require('sanitize-html'); // 외부에서 들어온 정보를 다시 보여줄때 문제가 발생할 수 있는 것을 차단(XSS)

exports.home = function (request, response) {
    db.query(`SELECT * FROM topic`, function (err, topics) {
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.list(topics);
        var html = template.HTML(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a>`);
        response.writeHead(200);
        response.end(html);
    });
};

exports.page = function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    db.query(`SELECT * FROM topic`, function (err, topics) {
        if (err) {
            throw err;
        }
        db.query(
            `SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`,
            [queryData.id],
            function (err, topic) {
                if (err) {
                    throw err;
                }
                var title = topic[0].title;
                var description = topic[0].description;
                var list = template.list(topics);
                var html = template.HTML(
                    title,
                    list,
                    `<h2>${sanitized(title)}</h2>${sanitized(description)}
                    <p>by ${sanitized(topic[0].name)}</p>
                    `,
                    ` <a href="/create">create</a>
                        <a href="/update?id=${queryData.id}">update</a>
                        <form action="delete_process" method="post">
                        <input type="hidden" name="id" value="${queryData.id}">
                        <input type="submit" value="delete">
                        </form>`
                );
                response.writeHead(200);
                response.end(html);
            }
        );
    });
};

exports.create = function (request, response) {
    db.query(`SELECT * FROM topic`, function (err, topics) {
        if (err) {
            throw err;
        }
        db.query(`SELECT * FROM author`, function (err, authors) {
            if (err) {
                throw err;
            }
            var title = 'Create';
            var list = template.list(topics);
            var html = template.HTML(
                sanitized(title),
                list,
                `
                <form action="/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p>
                    <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        ${template.selectAuthor(authors)}
                    </p>
                    <p>
                    <input type="submit">
                    </p>
                </form>
                `,
                `<a href="/create">create</a>`
            );
            response.writeHead(200);
            response.end(html);
        });
    });
};

exports.create_process = function (request, response) {
    var body = '';
    request.on('data', function (data) {
        body = body + data;
    });
    request.on('end', function () {
        var post = qs.parse(body);
        db.query(
            `INSERT INTO topic (title, description, created, author_id) VALUES(?, ?, NOW(), ?)`,
            [post.title, post.description, post.author],
            function (err, result) {
                if (err) {
                    throw err;
                }
                response.writeHead(302, {
                    Location: `/?id=${result.insertId}`,
                });
                response.end();
            }
        );
    });
};

exports.update = function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    db.query(`select * from topic`, function (err, topics) {
        if (err) {
            throw err;
        }
        db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], function (err, topic) {
            if (err) {
                throw err;
            }
            db.query(`SELECT * FROM author`, function (err, authors) {
                if (err) {
                    throw err;
                }
                var list = template.list(topics);
                var html = template.HTML(
                    topic[0].title,
                    list,
                    `
                    <form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${topic[0].id}">
                        <p><input type="text" name="title" placeholder="title" value="${sanitized(topic[0].title)}"></p>
                        <p>
                        <textarea name="description" placeholder="description">${sanitized(
                            topic[0].description
                        )}</textarea>
                        </p>
                        <p>
                        ${template.selectAuthor(authors, topic[0].author_id)}
                        </p>
                        <p> 
                        <input type="submit">
                        </p>
                    </form>
                    `,
                    `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        });
    });
};

exports.update_process = function (request, response) {
    var body = '';
    request.on('data', function (data) {
        body = body + data;
    });
    request.on('end', function () {
        var post = qs.parse(body);
        db.query(
            `UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`,
            [post.title, post.description, post.author, post.id],
            function (err, result) {
                response.writeHead(302, { Location: `/?id=${post.id}` });
                response.end();
            }
        );
    });
};

exports.delete_process = function (request, response) {
    var body = '';
    request.on('data', function (data) {
        body = body + data;
    });
    request.on('end', function () {
        var post = qs.parse(body);
        db.query(`DELETE FROM topic WHERE id=?`, [post.id], function (err, result) {
            if (err) {
                throw err;
            }
            response.writeHead(302, { Location: `/` });
            response.end();
        });
    });
};
