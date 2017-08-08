const { expect } = require('chai'),
  queryString = require('../src/queryString'),
  { variable } = require('davis-model');

describe('De-serialize query filters', function(){

  it('should deserialize single categorical', function(){
    const deserialized = queryString.queryFilters.deSerialize({
      'c4': '45'
    });

    expect(deserialized).to.deep.equal([
      {
        variable: 4,
        type: variable.types.categorical,
        attributes: [ 45 ]
      }
    ]);
  });

  it('should deserialize empty categorical', function(){
    const deserialized = queryString.queryFilters.deSerialize({
      'c4': ''
    });

    expect(deserialized).to.deep.equal([
      {
        variable: 4,
        type: variable.types.categorical,
        attributes: [ ]
      }
    ]);
  });

  it('should deserialize multiple categorical', function(){
    const deserialized = queryString.queryFilters.deSerialize({
      'c4': '4,5,6,78'
    });

    expect(deserialized).to.deep.equal([
      {
        variable: 4,
        type: variable.types.categorical,
        attributes: [ 4,5,6,78 ]
      }
    ]);
  });

  it('should deserialize numerical', function(){
    const deserialized = queryString.queryFilters.deSerialize({
      'n4': '<100'
    });    

    expect(deserialized).to.deep.equal([
      {
        variable: 4,
        type: variable.types.numerical,
        value: 100,
        comparator: '<'
      }
    ]);
  });

  it('should deserialize text', function(){
    const deserialized = queryString.queryFilters.deSerialize({
      't4': 'foo'
    });    

    expect(deserialized).to.deep.equal([
      {
        variable: 4,
        type: variable.types.text,
        value: 'foo'
      }
    ]);
  });

  it('should deserialize empty text', function(){
    const deserialized = queryString.queryFilters.deSerialize({
      't4': null
    });    

    expect(deserialized).to.deep.equal([
      {
        variable: 4,
        type: variable.types.text,
        value: ''
      }
    ]);
  });

  it('should deserialize multiple', function(){
    const deserialized = queryString.queryFilters.deSerialize({
      'n7': '<100',
      'c4': '4,5,6,78',
      't5': 'foo'
    });    

    expect(deserialized).to.deep.equal([
      {
        variable: 7,
        type: variable.types.numerical,
        value: 100,
        comparator: '<'
      },
      {
        variable: 4,
        type: variable.types.categorical,
        attributes: [ 4,5,6,78 ]
      },
      {
        variable: 5,
        type: variable.types.text,
        value: 'foo'
      }
    ]);
  });

  it('should throw for non c/n/t key', function(){
    expect(() => queryString.queryFilters.deSerialize({
      'u4': '4,5,6,78'
    })).to.throw(/Invalid variable key/);
  });

  it('should throw for bad variable id', function(){
    expect(() => queryString.queryFilters.deSerialize({
      'casdf': '4,5,6,78'
    })).to.throw(/Invalid variable ID/);
  });

  it('should throw for bad attributes', function(){
    expect(() => queryString.queryFilters.deSerialize({
      'c45': '4,5,asdf,78'
    })).to.throw(/Invalid attribute IDs/);
  });

  it('should throw for bad numerical value', function(){
    expect(() => queryString.queryFilters.deSerialize({
      'n45': '56'
    })).to.throw(/Invalid query value for numerical variable/);
  });

});

describe('Parse Query String', function(){

  it('should create empty map from empty string', function(){
    expect(queryString.stringToMap('')).to.deep.equal({});
  });

  it('should parse single value', function(){
    expect(queryString.stringToMap('foo=bar')).to.deep.equal({
      foo: 'bar'
    });
  });

  it('should parse multiple values', function(){
    expect(queryString.stringToMap('foo=bar&foo2=bar2')).to.deep.equal({
      foo: 'bar',
      foo2: 'bar2'
    });
  });

  it('should convert multiple values with same key to array', function(){
    expect(queryString.stringToMap('foo=bar&foo=bar2')).to.deep.equal({
      foo: ['bar', 'bar2']
    });
  });
});

