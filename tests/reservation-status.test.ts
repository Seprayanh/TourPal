/**
 * @file __tests__/reservation-status.test.ts
 * @description 订单状态机流转测试 + DRE 指标计算验证
 * @author 吕夏妍（技术评估负责人）
 * @date 2026-04
 */

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING:     ['ACCEPTED', 'CANCELLED'],
  ACCEPTED:    ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED:   [],
  CANCELLED:   [],
};

function isValidTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

function shouldMarkAsDefect(rating: number): boolean {
  return rating <= 2;
}

function calculateDRE(resolved: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((resolved / total) * 100);
}

describe('状态机 — 合法流转', () => {
  test('PENDING → ACCEPTED：向导接单', () =>
    expect(isValidTransition('PENDING', 'ACCEPTED')).toBe(true));
  test('PENDING → CANCELLED：游客取消', () =>
    expect(isValidTransition('PENDING', 'CANCELLED')).toBe(true));
  test('ACCEPTED → IN_PROGRESS：打卡开始', () =>
    expect(isValidTransition('ACCEPTED', 'IN_PROGRESS')).toBe(true));
  test('ACCEPTED → CANCELLED：向导取消', () =>
    expect(isValidTransition('ACCEPTED', 'CANCELLED')).toBe(true));
  test('IN_PROGRESS → COMPLETED：行程完成', () =>
    expect(isValidTransition('IN_PROGRESS', 'COMPLETED')).toBe(true));
});

describe('状态机 — 非法流转', () => {
  test('PENDING → IN_PROGRESS：跳过接单（非法）', () =>
    expect(isValidTransition('PENDING', 'IN_PROGRESS')).toBe(false));
  test('PENDING → COMPLETED：跳过全流程（非法）', () =>
    expect(isValidTransition('PENDING', 'COMPLETED')).toBe(false));
  test('ACCEPTED → PENDING：状态降级（非法）', () =>
    expect(isValidTransition('ACCEPTED', 'PENDING')).toBe(false));
  test('COMPLETED → CANCELLED：终态不可变（非法）', () =>
    expect(isValidTransition('COMPLETED', 'CANCELLED')).toBe(false));
  test('CANCELLED → ACCEPTED：取消后不可接单（非法）', () =>
    expect(isValidTransition('CANCELLED', 'ACCEPTED')).toBe(false));
});

describe('差评自动标记', () => {
  test('rating=1 → isDefect=true', () =>
    expect(shouldMarkAsDefect(1)).toBe(true));
  test('rating=2（临界值）→ isDefect=true', () =>
    expect(shouldMarkAsDefect(2)).toBe(true));
  test('rating=3 → isDefect=false', () =>
    expect(shouldMarkAsDefect(3)).toBe(false));
  test('rating=5 → isDefect=false', () =>
    expect(shouldMarkAsDefect(5)).toBe(false));
});

describe('DRE 缺陷消除效率', () => {
  test('3/4 → DRE=75%', () => expect(calculateDRE(3, 4)).toBe(75));
  test('5/5 → DRE=100%', () => expect(calculateDRE(5, 5)).toBe(100));
  test('0/0（无差评）→ DRE=100%', () => expect(calculateDRE(0, 0)).toBe(100));
  test('0/6（未处理）→ DRE=0%', () => expect(calculateDRE(0, 6)).toBe(0));
  test('1/3 → DRE=33%', () => expect(calculateDRE(1, 3)).toBe(33));
});