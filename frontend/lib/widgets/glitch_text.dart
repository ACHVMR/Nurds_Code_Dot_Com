import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';

class GlitchText extends StatefulWidget {
  final String text;
  final TextStyle? style;
  final Duration durationBeforeStabilize;

  const GlitchText(
    this.text, {
    super.key,
    this.style,
    this.durationBeforeStabilize = const Duration(milliseconds: 1500),
  });

  @override
  State<GlitchText> createState() => _GlitchTextState();
}

class _GlitchTextState extends State<GlitchText> {
  late String _displayText;
  late Timer _timer;
  final Random _random = Random();
  final String _chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#\$%^&*()_+-=[]{}|;:,.<>?';
  bool _isStabilized = false;

  @override
  void initState() {
    super.initState();
    _displayText = _obfuscate(widget.text);
    _startGlitchEffect();
    
    // Stabilize after duration
    Future.delayed(widget.durationBeforeStabilize, () {
      if (mounted) {
        setState(() {
          _isStabilized = true;
          _displayText = widget.text;
        });
        _timer.cancel();
      }
    });
  }

  void _startGlitchEffect() {
    _timer = Timer.periodic(const Duration(milliseconds: 50), (timer) {
      if (!_isStabilized && mounted) {
        setState(() {
          _displayText = _obfuscate(widget.text);
        });
      }
    });
  }

  String _obfuscate(String input) {
    if (_isStabilized) return input;
    
    // Randomly reveal some characters as we get closer to the end? 
    // For now, pure chaos until stabilization looks more "decoding"
    return String.fromCharCodes(Iterable.generate(
      input.length,
      (index) {
        // Retrieve correct char if space or occasionally based on random chance 
        if (input[index] == ' ') return 32; // space
        if (_random.nextDouble() > 0.7) return input.codeUnitAt(index);
        return _chars.codeUnitAt(_random.nextInt(_chars.length));
      },
    ));
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Text(
      _displayText,
      style: widget.style,
    );
  }
}
