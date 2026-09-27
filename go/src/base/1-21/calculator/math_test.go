package calculator_test

import (
	"1-21/calculator"
	"testing"
)

func TestMultiply(t *testing.T) {
	tests := []struct {
		name string // description of this test case
		// Named input parameters for target function.
		a    int
		b    int
		want int
	}{
		// TODO: Add test cases.
		{"Multiply 10 * 15", 10, 15, 150},
		{"Multiply 10 * 0", 10, 0, 0},
		{"Multiply 0 * 0", 0, 0, 0},
		{"Multiply 10 * -15", 10, -15, -150},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := calculator.Multiply(tt.a, tt.b)
			// TODO: update the condition below to compare got with tt.want.
			if got != tt.want {
				t.Errorf("Multiply() = %v, want %v", got, tt.want)
			}
		})
	}
}

func BenchmarkMultiply(b *testing.B) {
	for i := 0; i < b.N; i++ {
		calculator.Multiply(1, 2)
	}
}
