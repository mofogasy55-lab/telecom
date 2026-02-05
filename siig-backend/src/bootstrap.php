<?php

declare(strict_types=1);

require __DIR__ . '/helpers.php';
require __DIR__ . '/env.php';
require __DIR__ . '/db.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/timetable.php';
require __DIR__ . '/courses.php';
require __DIR__ . '/assessments.php';
require __DIR__ . '/grades.php';
require __DIR__ . '/router.php';

cors();

db_init();
