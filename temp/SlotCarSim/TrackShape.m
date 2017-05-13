r = (3*pi/2):(-pi/10):pi/2;
x = 8.25 * cos(r);
y = 8.25 * sin(r);
xtemp = (pi/5/.3491):(pi/5/.3491): ((2*pi / .3491) - 2*(pi/5/.3491));
x = [x xtemp];
y = [y (.75 * cos(.3491 * xtemp) + 8.25 - 0.75)];
x,y
r = (pi/2):(-pi/10):-pi/2;
x = [x (8.25 * cos(r) + 9 + 8.25)];
y = [y 8.25 * sin(r)];
x = [x ((17.25 - 3.45):-3.45:0)];
y = [y (-8.25 * ones(1,5))];
n = 400;
[xi, yi, tk] = paramSpline(x, y, n);
figure
hold on
plot(xi, yi, '.', 0, 0, 'or',[ -8.25 0], [0 0]);
text(-5, 1, '8.25 in');
title('Modeled Track');
axis equal
xi = xi - ((max(xi) + min(xi))/2.0);
yi = yi - ((max(yi) + min(yi))/2.0);
max(xi) * 2
x = -1 * xi ./ max(xi);
y = -1 * yi ./ max(xi);
figure
plot(x, y, '.');
axis equal
fileID = fopen('track4.txt','w');
fprintf(fileID, '%f,%f|', [x y]');
fclose(fileID);