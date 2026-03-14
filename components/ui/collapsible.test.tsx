import { render, fireEvent } from '@testing-library/react-native';
import { Collapsible } from './collapsible';
import { Text } from 'react-native';

// Provide basic mocks for hooks and icons
jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn().mockReturnValue('light'),
}));

jest.mock('@/components/ui/icon-symbol', () => {
  const { Text } = require('react-native');
  return {
    IconSymbol: (props: any) => <Text testID="icon-symbol" {...props} />
  };
});

describe('Collapsible', () => {
  it('toggles content visibility when pressed', () => {
    const { getByText, queryByText } = render(
      <Collapsible title="Test Title">
        <Text>Test Content</Text>
      </Collapsible>
    );

    // Initial state: Title is visible, content is not
    expect(getByText('Test Title')).toBeTruthy();
    expect(queryByText('Test Content')).toBeNull();

    // Press the header to open the collapsible
    fireEvent.press(getByText('Test Title'));

    // After press: Content should now be visible
    expect(getByText('Test Content')).toBeTruthy();

    // Press again to close
    fireEvent.press(getByText('Test Title'));

    // After second press: Content should be hidden again
    expect(queryByText('Test Content')).toBeNull();
  });
});
