const { customAlphabet, nanoid } = require('nanoid');

let generateId = nanoid

function nanoidPlugin(schema, { length, alphabet }) {
    if (schema.options._id !== undefined && schema.options._id === false) return;

    length = length || 12;

    if (alphabet) {
        generateId = customAlphabet(alphabet, length);
    }

    let _id = '_id';
    const dataObj = {};

    dataObj[_id] = {
        type: String,
        default: function () {
            return generateId(length)
        }
    };

    schema.add(dataObj);
    schema.pre('save', function (next) {
        if (this.isNew && !this.constructor.$isArraySubdocument) {
            attemptToGenerate(this, length)
                .then(function (newId) {
                    this[_id] = newId;
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
