const { customAlphabet, nanoid } = require('nanoid');

let generateId = nanoid

function nanoidPlugin(schema, { length, alphabet, prefix, postfix }) {
    if (schema.options._id !== undefined && schema.options._id === false) return;

    length = length || 12;

    if (alphabet) {
        generateId = customAlphabet(alphabet, length);
    }

    prefix = schema.options._idPrefix || '';
    postfix = schema.options._idPostfix || '';

    let _id = '_id';
    const dataObj = {};

    dataObj[_id] = {
        type: String,
        default: function () {
            return prefix + generateId(length) + postfix
        }
    };

    schema.add(dataObj);
    schema.pre('save', function (next) {
        if (this.isNew && !this.constructor.$isArraySubdocument) {
            attemptToGenerate(this, length)
                .then(function (newId) {
                    this[_id] = prefix + newId + postfix;
                    next()
                })
                .catch(next)
        } else next();
    });
}

function attemptToGenerate(doc, length) {
    const id = generateId(length);

    return doc.constructor.findById(id)
        .then(function (found) {
            if (found) return attemptToGenerate(doc, length);
            return id
        })
}

module.exports = nanoidPlugin;
