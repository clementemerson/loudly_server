module.exports = {
    shouldExist: (fn) => {
        test('should exist', () => {
            // Expects
            expect(fn).toBeDefined();
        });
    },
    shouldBeAFunction: (fn) => {
        test('should be a function', () => {
            // Expects
            expect(typeof fn).toBe('function');
        });
    }
}