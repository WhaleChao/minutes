import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('diarization_runner', Path(__file__).with_name('run.py'))
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)


class ScoringTests(unittest.TestCase):
    def test_unknown_cannot_be_mapped_into_a_reference_identity(self):
        reference = [{'start': 0, 'end': 4, 'speaker': 'person'}]
        hypothesis = {'segments': [{'start': 0, 'end': 4, 'speaker': 'UNKNOWN'}]}
        result = runner.score(reference, hypothesis, 4)
        self.assertEqual(result['der'], 1)
        self.assertEqual(result['missed_speaker_seconds'], 4)
        self.assertEqual(result['predicted_speakers'], 0)
        self.assertEqual(result['unknown_speaker_seconds'], 4)

    def test_global_mapping_cannot_flip_between_windows(self):
        reference = [{'start': 0, 'end': 2, 'speaker': 'a'}, {'start': 2, 'end': 4, 'speaker': 'b'},
                     {'start': 4, 'end': 6, 'speaker': 'a'}, {'start': 6, 'end': 8, 'speaker': 'b'}]
        hypothesis = {'segments': [{'start': i * 2, 'end': i * 2 + 2, 'speaker': label}
                                   for i, label in enumerate(['x', 'y', 'y', 'x'])]}
        self.assertEqual(runner.score(reference, hypothesis, 8)['der'], .5)

    def test_overlap_counts_both_reference_voices(self):
        reference = [{'start': 0, 'end': 4, 'speaker': 'a'}, {'start': 2, 'end': 4, 'speaker': 'b'}]
        hypothesis = {'segments': [{'start': 0, 'end': 4, 'speaker': 'x'}]}
        result = runner.score(reference, hypothesis, 4)
        self.assertAlmostEqual(result['der'], 2 / 6)
        self.assertEqual(result['reference_speaker_seconds'], 6)

    def test_malformed_unknown_still_fails_validation(self):
        with self.assertRaises(ValueError):
            runner.score([], {'segments': [{'start': 0, 'end': 5, 'speaker': 'UNKNOWN'}]}, 4)

    def test_rttm_keeps_overlap_and_clips_at_audio_end(self):
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / 'reference.rttm'
            path.write_text('SPEAKER m 1 0 3 <NA> <NA> a <NA> <NA>\n'
                            'SPEAKER m 1 2 3 <NA> <NA> b <NA> <NA>\n')
            self.assertEqual(runner.reference_segments(path, 4), [
                {'start': 0., 'end': 3., 'speaker': 'a'}, {'start': 2., 'end': 4, 'speaker': 'b'}])


if __name__ == '__main__':
    unittest.main()
