import { render, screen } from '@testing-library/react-native';

import { IntroSplash } from '@/src/components/intro-splash';

describe('IntroSplash', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders the branded intro and finishes after the animation window', () => {
    const onFinish = jest.fn();

    render(<IntroSplash onFinish={onFinish} />);

    expect(screen.getByText('ResellerIO')).toBeTruthy();
    expect(screen.getByText('Inventory, AI, and storefront flow in your pocket.')).toBeTruthy();

    jest.advanceTimersByTime(2400);

    expect(onFinish).toHaveBeenCalled();
  });
});
