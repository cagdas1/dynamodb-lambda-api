import Ajv from "ajv";
const ajv = new Ajv();;

export function validateBody(input: any) {
    const validate = ajv.compile(schema);
    const valid = validate(input);
    if(valid) return {valid: true, errors: []}
    else return {valid:false, errors: validate.errors }
}

const schema = {
    type: "object",
    properties: {
      items: {type: "array", items: {type: "string",  minLength: 2, maxLength: 100}},
      address: {type:"string", minLength: 2, maxLength: 100},
      name: {type:"string", minLength: 2, maxLength: 50},
      payment: {type:"string", minLength: 2, maxLength: 10}
    },
    required: ["items", "address", "name", "payment"]
  }