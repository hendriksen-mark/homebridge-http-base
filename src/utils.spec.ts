import {utils} from './index';
import {Characteristic, Service} from 'hap-nodejs';

describe('utils', () => {
  describe('pattern', () => {
    it('should extract number correctly', () => {
      expect(utils.extractValueFromPattern(/asd(\d)/, 'asd4')).toEqual('4');
    });
    it('should fail on unmatched pattern', () => {
      expect(() => {
        utils.extractValueFromPattern(/asdf/, 'lol')
      }).toThrow(Error);
    });
    it('should fail with position out of range', () => {
      expect(() => {
        utils.extractValueFromPattern(/asd(\d)/, 'asd4', 2);
      }).toThrow(Error);
    });
  });

  describe('enum', () => {
    let enumObject: any;
    beforeAll(() => {
      enumObject = Object.freeze({
        VALUE_1: 'value1',
        VALUE_2: 'value2',
      });
    });

    it('should retrieve enum value', () => {
      expect(utils.enumValueOf(enumObject!, 'value1', enumObject.VALUE_2)).toEqual(enumObject.VALUE_1);
    });
    it('should fallback to default value', () => {
      expect(utils.enumValueOf(enumObject!, undefined, enumObject.VALUE_2)).toEqual(enumObject.VALUE_2);
    });
  });

  describe('once', () => {
    it('should run only once', () => {
      let boolean = true;
      const fun = () => {
        boolean = !boolean;
      };

      const once = utils.once(fun);
      once();
      expect(once).toThrow(Error);
      expect(boolean).toEqual(false);
    });
  });

  describe('characteristics search', () => {
    let service: Service | undefined;
    beforeAll(() => {
      service = new Service.HumiditySensor('', '');
    });

    it('should test added characteristic', () => {
      expect(utils.testCharacteristic(service!, 'CurrentRelativeHumidity')).toEqual(true);
    });
    it('should test optional characteristic', () => {
      expect(utils.testCharacteristic(service!, 'StatusActive')).toEqual(false);
    });
    it('should test characteristic not added', () => {
      expect(utils.testCharacteristic(service!, 'RotationSpeed')).toEqual(false);
    });
    it('should reject malformed name', () => {
      expect(utils.testCharacteristic(service!, 'Current Relative Humidity')).toEqual(false);
    });

    it('should get added characteristic', () => {
      expect(utils.getCharacteristic(service!, 'CurrentRelativeHumidity')).toBeInstanceOf(Characteristic.CurrentRelativeHumidity);
    });
    it('should get optional characteristic', () => {
      expect(utils.getCharacteristic(service!, 'StatusActive')).toBeNull();
    });
    it('should get characteristic not added', () => {
      expect(utils.getCharacteristic(service!, 'RotationSpeed')).toBeNull();
    });
    it('should reject malformed name in get', () => {
      expect(utils.getCharacteristic(service!, 'Current Relative Humidity')).toBeNull();
    });
  });
});
