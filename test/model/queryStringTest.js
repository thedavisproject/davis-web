const { expect } = require('chai'),
  queryString = require('../../src/model/queryString'),
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

  it('should deserialize quantitative', function(){
    const deserialized = queryString.queryFilters.deSerialize({
      'q4': '<100'
    });    

    expect(deserialized).to.deep.equal([
      {
        variable: 4,
        type: variable.types.quantitative,
        value: 100,
        comparator: '<'
      }
    ]);
  });

  it('should deserialize multiple', function(){
    const deserialized = queryString.queryFilters.deSerialize({
      'q7': '<100',
      'c4': '4,5,6,78'
    });    

    expect(deserialized).to.deep.equal([
      {
        variable: 7,
        type: variable.types.quantitative,
        value: 100,
        comparator: '<'
      },
      {
        variable: 4,
        type: variable.types.categorical,
        attributes: [ 4,5,6,78 ]
      }
    ]);
  });

  it('should throw for non c/q key', function(){
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

  it('should throw for bad quantitative value', function(){
    expect(() => queryString.queryFilters.deSerialize({
      'q45': '56'
    })).to.throw(/Invalid query value for quantitative variable/);
  });

});

